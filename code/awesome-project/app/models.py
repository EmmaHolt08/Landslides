# app/models.py
from sqlalchemy import Column, Integer, String, Text
from .database import Base # Import Base from your database.py in the same package
from geoalchemy2 import Geometry # This is for generic geometry columns

# This class represents the 'products' table in your PostgreSQL database
class DataImport(Base):
    __tablename__ = "data_import" # The actual table name in your database

    # columns for the table

    # id: Primary key
    landslideid = Column(String, primary_key=True, index=True)

    latitude = Column(String)

    longitude = Column(String)

    lstype = Column(String)

    lssource = Column(String)

    impact = Column(String)

    wea13_id = Column(Integer, nullable = True)

    wea13_type = Column(String, nullable = True)

    coords = Column(Geometry(geometry_type='POINT', srid=4326))

    user_id = Column(String, nullable = True)


    def __repr__(self):
        return (f"<DataImport(landslideid={self.landslideid}, latitude={self.latitude}, longitude={self.longitude},"
                f"lstype={self.lstype}, lssource={self.lssource}, impact={self.impact}, wea13_id={self.wea13_id},"
                f"wea13_type={self.wea13_type}, coords={self.coords})>")
    

class UserInfo (Base):

    __tablename__ = "user_info"

    user_id = Column (String, primary_key = True, index = True)

    username = Column (String)

    user_email = Column (String)

    user_password = Column (String)

    def __repr__(self):
        return (f"<UserInfo(user_id={self.user_id}, username={self.username}, user_email={self.user_email}, user_password={self.user_password}),>")