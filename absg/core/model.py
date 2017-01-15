#!env/python3
# coding: utf-8
import os
import time
import datetime
import json
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker



from core.framework import *













# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# DATABASE CONNECTION
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 




# Connect and map the engine to the database
Base = automap_base()
db_engine = create_engine("postgresql://{0}:{1}@{2}:{3}/{4}".format(DATABASE_USER, DATABASE_PWD, DATABASE_HOST,  DATABASE_PORT, DATABASE_NAME))
Base.prepare(db_engine, reflect=True)
Base.metadata.create_all(db_engine)


# Session shall be local to thread
db_session_factory = sessionmaker(bind=db_engine)
Session = scoped_session(db_session_factory)

# So now, each time we need to create a session "local" to a thread  (independant with others thread's session)
# Just need to create new one with the constructor : Session()
# The main "global" session
db_session = Session()














# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# USER
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

def user_from_id(user_id):
    """
        Retrieve User with the provided id in the database
    """
    return db_session.query(User).filter_by(id=user_id).first();


def user_save(self):
    """
        Commit modification done on the user into the database
    """
    session = Session()
    session.add(self)
    session.commit()




User = Base.classes.absg_users
User.from_id = user_from_id
User.save    = user_save