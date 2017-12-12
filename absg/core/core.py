#!env/python3
# coding: utf-8
import os
from importlib import import_module

import config as C
from core.framework.common import *
# from core.model import *
# from core.managers import *










# =====================================================================================================================
# CORE MAIN OBJECT
# =====================================================================================================================
def default_notify_all(data):
    """
        Default delegate used by the core for notification.
    """
    print(str(data))


class Core:
    def __init__(self):
        # Managers
        # self.files = FileManager()
        
        # Notify all method
        # according to api that will be pluged on the core, this method should be overriden 
        # (See how api_rest override this method in api_rest/rest.py)
        self.notify_all = default_notify_all


    def notify_all(self, data):
        """
            Default delegate used by the core for notification.
            according to api that will be pluged on the core, this method should be overriden 
            (See how api_rest override this method in api_rest/rest.py)
        """
        print(str(data))
    

    def user_authentication(self, login, pwd):
        """
            Return the User if credential match.
        """
        return User.from_credential(login, pwd);






# =====================================================================================================================
# INIT OBJECTS
# =====================================================================================================================

core = Core()
log('AbsG core initialised. Server ready !')

