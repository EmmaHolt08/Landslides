from fastapi import FastAPI, Depends, HTTPException, status, Form, Header
from sqlalchemy.orm import Session
from typing import List, Optional, Any 
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import json
import uuid 
from sqlalchemy.sql import func
from geoalchemy2 import WKTElement, Geometry
from sqlalchemy import Integer, Column, String

from app.database import engine, Base, get_db
from app.models import DataImport, UserInfo
from app import router

import bcrypt

Base.metadata.create_all(bind=engine)

async def get_current_user(
    authorization: str = Header(...), 
    db: Session = Depends(get_db) 
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme. Must be Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
     
    token = authorization.split(" ")[1]

    user = db.query(UserInfo).filter(UserInfo.user_id == token).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token (or user not found)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user 

app = FastAPI()

# to give front end accesss to back end (need to be changed?)
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,        
    allow_methods=["*"],          
    allow_headers=["*"],          
)

#to hash passowrd
class Hasher:
    @staticmethod #checks password when user is logging in
    def verify_password(plain_password: str, hashed_password: str) -> bool:
       return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('latin-1'))
    
    @staticmethod #hashes password
    def get_password_hash(password: str) -> str:
        s = bcrypt.gensalt()
        hashed_password_bytes = bcrypt.hashpw(password.encode('utf-8'), s)
        return hashed_password_bytes.decode('latin-1') #to be stored in db

app.include_router(router.router)

@app.get('/')
def home():
    return{
        "message" : "we are home"
    }

class UserCreate(BaseModel):
    username: str
    email: str 
    password: str 

class UserResponse(BaseModel):
    user_id: str
    username: str
    email: str  = Field(alias='user_email')

    model_config = {'from_attributes': True}

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    username: str
    email: str

class DataImportCreate(BaseModel):
    landslideID: str
    latitude: float
    longitude: float
    lsType: str     
    lsSource: str   
    impact: str
    wea13_id: Optional[str] = None
    wea13_type: Optional[str] = None
    user_id: Optional[str] = None

# Data model for data that will be sent in API responses
class DataImportResponse(BaseModel):
    landslideID: str
    latitude: float
    longitude: float
    lsType: str     
    lsSource: str   
    impact: str
    wea13_id: Optional[str]
    wea13_type: Optional[str]
    geometry: Any 
    user_id: Optional[str]

    model_config = {'from_attributes': True}

#for sign up
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    #checks db for email
    db_user = db.query(UserInfo).filter(UserInfo.user_email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    #checks db for username (case insensitive)
    lowercaseUsername = user.username.lower()
    db_user2 = db.query(UserInfo).filter(UserInfo.username == lowercaseUsername).first()
    if db_user2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username taken. Choose a new one"
        )
    
    #creates user id if checks pass
    new_user_id = str(uuid.uuid4()) 

    #creates the hashed password
    hashed_password_string = Hasher.get_password_hash(user.password)

    #sends user info through to db
    db_user = UserInfo(user_id=new_user_id, username=user.username, user_email=user.email, user_password=hashed_password_string) 
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

#the user
@app.get("/users/me", response_model=UserResponse)
async def read_users_me(
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user

#user token
@app.post("/token", response_model=Token)
async def login_for_access_token(
    email: str = Form(..., alias="email"),
    password: str = Form(...),                
    db: Session = Depends(get_db)
):
    #checks email 
    user = db.query(UserInfo).filter(UserInfo.user_email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    #checks password
    if not Hasher.verify_password(password, user.user_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password", 
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {
        "access_token": user.user_id, 
        "token_type": "bearer",
        "user_id": user.user_id, 
        "username": user.username,
        "email": user.user_email,
    }

#report form
@app.post("/data-imports/", response_model=DataImportResponse, status_code=status.HTTP_201_CREATED)
async def create_data_import(data_import: DataImportCreate, db: Session = Depends(get_db)):
    point_geom = WKTElement(f"POINT({data_import.longitude} {data_import.latitude})", srid=4326)

    db_data_import = DataImport(
        landslideid=data_import.landslideID,
        latitude=data_import.latitude,  
        longitude=data_import.longitude,
        lstype=data_import.lsType,
        lssource=data_import.lsSource,
        impact=data_import.impact,
        wea13_id=data_import.wea13_id,
        wea13_type=data_import.wea13_type,
        coords=point_geom,
        user_id=data_import.user_id,
    )

    db.add(db_data_import)
    db.commit()
    db.refresh(db_data_import)

    geometry_geojson_string = db.scalar(func.ST_AsGeoJSON(db_data_import.coords))
    geometry_geojson_dict = json.loads(geometry_geojson_string)

    return DataImportResponse.model_validate({
        "landslideID": db_data_import.landslideid,
        "latitude": db_data_import.latitude,
        "longitude": db_data_import.longitude,
        "lsType": db_data_import.lstype,
        "lsSource": db_data_import.lssource,
        "impact": db_data_import.impact,
        "wea13_id": db_data_import.wea13_id,
        "wea13_type": db_data_import.wea13_type,
        "geometry": geometry_geojson_dict,
    })

class MaxIDsResponse(BaseModel):
    max_landslide_id: Optional[int]

#for report form (gets the max ls ID)
@app.get("/get-max-ids/", response_model=MaxIDsResponse)
async def get_max_ids(db: Session = Depends(get_db)):
    
    max_landslide_id = db.query(func.max(DataImport.landslideid.cast(Integer))).scalar()

    if max_landslide_id is not None:
        try:
            max_landslide_id = int(max_landslide_id)
        except ValueError:
            max_landslide_id = None 
            print("Warning: max id is not valid integer.")


    return MaxIDsResponse(
        max_landslide_id=max_landslide_id,
    )

#query form
@app.get("/query-data-imports/", response_model=List[DataImportResponse])
async def query_data_imports(
    # Query parameters 
    search_landslideid: Optional[str] = None,
    min_latitude: Optional[float] = None,
    max_latitude: Optional[float] = None,
    min_longitude:Optional[float] = None,
    max_longitude:Optional[float] = None,
    landslide_type: Optional[str] = None,
    landslide_source: Optional[str] = None,
    impact: Optional[str] = None,
    wea13_id: Optional[str] = None,
    wea13_type: Optional[str] = None,
    coordinates: Optional[str] = None,
    db: Session = Depends(get_db)
):
    
    query = db.query(
        DataImport.landslideid.label('landslideID'),
        DataImport.latitude.label('latitude'),
        DataImport.longitude.label('longitude'),
        DataImport.lstype.label('lsType'),          
        DataImport.lssource.label('lsSource'),       
        DataImport.impact.label('impact'),
        DataImport.wea13_id.label('wea13_id'),
        DataImport.wea13_type.label('wea13_type'),
        func.ST_AsGeoJSON(DataImport.coords).label('geometry_json_string'),
        DataImport.user_id.label('user_id')
       )

    if search_landslideid:
        query = query.filter(DataImport.landslideid == search_landslideid)

    if min_latitude is not None:
        query = query.filter(DataImport.latitude >= min_latitude)

    if max_latitude is not None:
        query = query.filter(DataImport.latitude <= max_latitude)

    if min_longitude is not None:
        query = query.filter(DataImport.longitude >= min_longitude)

    if max_longitude is not None:
        query = query.filter(DataImport.longitude <= max_longitude)

    if landslide_type is not None:
        query = query.filter(DataImport.lstype == landslide_type)

    if landslide_source is not None:
        query  = query.filter(DataImport.lssource == landslide_source)

    if impact is not None:
        query = query.filter(DataImport.impact == impact)

    if wea13_id is not None:
        query = query.filter(DataImport.wea13_id == wea13_id)

    if wea13_type is not None:
        query = query.filter(DataImport.wea13_type == wea13_type)

    if coordinates is not None:
        lon, lat = map(float, coordinates.split())
        point_geom = WKTElement(f"POINT({lon} {lat})", srid=4326)
        query = query.filter(func.ST_Equals(DataImport.coords, point_geom))

    records = query.all()

    if not records:
        raise HTTPException(status_code=404, detail="No data import records found matching your criteria.")

    final_response_data = []
    for rec in records:
        rec_dict = rec._asdict() 
        
        # Parse the geometry string and assign it to the 'geometry' key
        # for the points on the home page/mapcoords
        if 'geometry_json_string' in rec_dict and rec_dict['geometry_json_string'] is not None:
            try:
                rec_dict['geometry'] = json.loads(rec_dict['geometry_json_string'])
            except json.JSONDecodeError:
                print(f"Error parsing geometry string in query_data_imports: {rec_dict['geometry_json_string']}")
                rec_dict['geometry'] = None 
        else:
            rec_dict['geometry'] = None 

        del rec_dict['geometry_json_string'] 
        
        final_response_data.append(DataImportResponse.model_validate(rec_dict))

    return final_response_data