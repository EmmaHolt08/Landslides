from fastapi import APIRouter

router = APIRouter(
    prefix = '/report',
    tags = ['report']
)

@router.get('/form')
def submit_form():
    return {
        "message" : "we are submitting a form",
    }

@router.get('/success')
def sucess_submit():
    return{
        "message" : "we have been successful",
    }