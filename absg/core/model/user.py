#!env/python3
# coding: utf-8
import os
import json


from core.framework.common import *
from core.framework.postgresql import *
from passlib.hash import pbkdf2_sha256




def user_init(self, loading_depth=0, force=False):
    """
        Init properties of an user :
            - id            : int       : the unique id of the user in the database
            - login         : str       : the login of the user
            - firstname     : str       : firstname of the user
            - lastname      : str       : lastname of the user
            - email         : str       : email
            - function      : str       : the function of the user
            - location      : str       : the location of the user
            - is_admin      : bool      : is the user an admin or not
            - is_activated  : bool      : is the user activated or not
            - sandbox_id    : int       : this id refer to the sandbox project of the user
            - update_date   : datetime  : the last time that the object have been updated
            - create_date   : datetime  : the date when the object have been created
        If loading_depth is > 0, Following properties fill be loaded : (Max depth level is 2)
            - sandbox       : Project   : The sandbox project of the user
    """
    from core.model.project import Project
    # Avoid recursion infinit loop
    if hasattr(self, "loading_depth") and not force:
        return
    else:
        self.loading_depth = min(2, loading_depth)

    try:
        self.sandbox = None
        if self.loading_depth > 0:
            self.sandbox = Project.from_id(self.sandbox_id, self.loading_depth-1)
    except Exception as ex:
        raise AbsgException("User data corrupted (id={}).".format(self.id), "", ex)





def user_from_id(user_id, loading_depth=0):
    """
        Retrieve user with the provided id in the database
    """
    user = Session().query(User).filter_by(id=user_id).first()
    if user : 
        Session().refresh(user)
        user.init(loading_depth)
    return user


def user_from_ids(user_ids, loading_depth=0):
    """
        Retrieve files corresponding to the list of provided id
    """
    users = []
    if user_ids and len(user_ids) > 0:
        users = Session().query(User).filter(User.id.in_(user_ids)).all()
        for u in users:
            Session().refresh(u)
            u.init(loading_depth)
    return users


def user_from_credential(login, pwd):
    """
        Retrieve File with the provided login+pwd in the database
    """
    user = Session().query(User).filter_by(login=login).first()
    if user:
        user.init()
        if user.password is None:
            # Can occur if user created without password
            return user
        if pbkdf2_sha256.verify(pwd, user.password):
            return user
    return None


def user_to_json(self, fields=None, loading_depth=-1):
    """
        Export the user into json format with only requested fields
    """
    result = {}
    if loading_depth < 0:
        loading_depth = self.loading_depth
    if fields is None:
        fields = User.public_fields
    for f in fields:  
        if f in User.public_fields:
            if f in ["update_date", "create_date"]:
                result.update({f: eval("self." + f + ".isoformat()")})
            elif f in ["sandbox"] and self.loading_depth > 0:
                result.update({f: eval("self.{}.to_json(None, loading_depth-1)".format(f))})
            else:
                result.update({f: eval("self." + f)})
    return result



def user_load(self, data):
    """
        Helper to update user's data by loading a json.
        Note that following properties cannot be set by this ways :
            - sandbox_id / sandbox (which MUST not be changed)
            - update_date / create_date (which are managed automaticaly by the server)
    """
    try:
        # Required fields
        if "login" in data.keys() : self.login = check_string(data["login"])
        if "firstname" in data.keys() : self.firstname = check_string(data["firstname"])
        if "lastname" in data.keys() : self.lastname = check_string(data["lastname"])
        if "email" in data.keys() : self.email = check_string(data["email"])
        if "function" in data.keys() : self.function = check_string(data["function"])
        if "location" in data.keys() : self.location = check_string(data["location"])
        if "is_admin" in data.keys() : self.is_admin = data["is_admin"]
        if "is_activated" in data.keys() : self.is_activated = check_bool(data["is_activated"])
        # Update password
        if "password" in data.keys() and check_string(data["password"]) and "oldpassword" in data.keys() and check_string(data["oldpassword"]): 
            self.set_password(check_string(data["oldpassword"]), check_string(data["password"]))
        self.save()
    
        # reload dynamics properties
        self.init(self.loading_depth, True)
    except KeyError as e:
        raise AbsgException('Invalid input project: missing ' + e.args[0])
    return self


def user_set_password(self, old, new):
    """
        This method must be used to set the password of a user
        Return True if the password have be changed, False otherwise
    """
    if (old == None and user.password == None) or pbkdf2_sha256.verify(old, user.password):
        self.password = pbkdf2_sha256.encrypt(new, rounds=200000, salt_size=16)
        self.save()
        return True
    return False


def user_erase_password(self, new):
    """
        Method that erase password with a new one when we forgot the former one.
    """
    self.password = pbkdf2_sha256.encrypt(new, rounds=200000, salt_size=16)
    self.save()
    return True





def user_delete(user_id):
    """
        Delete the user with the provided id in the database
    """
    from core.model.project import Project
    
    u = User.from_id(user_id)
    if u:
        Project.delete(u.sandbox_id)
        Session().query(User).filter_by(id=user_id).delete(synchronize_session=False)
        



def user_count():
    """
        Return total of Analyses entries in database
    """
    return generic_count(User)


def user_new(login=None):
    """
        Return a new user object
    """
    from core.model.project import Project
    # Check login or create a fake one if not provided
    if not login:
        login = "user_{}".format(User.count() + 1)
        
    # create sandbox project
    sandbox = Project.new()
    sandbox.load({"comment": "My sandbox"})
        
    u = User(login=login, sandbox_id=sandbox.id)
    
    try:
        u.save()
    except Exception as ex:
        raise AbsgException("Unable to create new user with provided informations.", "", ex)
    return u
    


User = Base.classes.user
User.public_fields = ["id", "firstname", "lastname", "login", "email", "function", "location", "update_date", "create_date", "sandbox_id", "sandbox", "is_activated", "is_admin"]
User.init = user_init
User.from_id = user_from_id
User.from_ids = user_from_ids
User.from_credential = user_from_credential
User.load = user_load
User.to_json = user_to_json
User.set_password = user_set_password
User.erase_password = user_erase_password
User.save = generic_save
User.new = user_new
User.count = user_count
User.delete = user_delete
