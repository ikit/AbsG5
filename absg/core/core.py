#!env/python3
# coding: utf-8
import os
import asyncio

import config as C
from core.framework.common import *
from core.model import *
#from core.managers import *





#
# The version of the source code
#
ABSG_DB_VERSION = "1"          # Used only by the core to know if compatible with current Regovar DB schema
ABSG_CORE_VERSION = "0.1.0"    # Official version of the Absolument G Server (used client side to know if client compatible with this server)
    # Version nomenclature: AbsG_Major.ServerApi_Major.ServerApi_Minor
    #   AbsG_Major:       incremented when project leader decision 
    #   ServerApi_Major : to be increment when the api signature change (route or json answer) => force absg client to update to be complient
    #   ServerApi_Minor : increment when minor change server side that don't need update client side to use this api





# =====================================================================================================================
# CORE MAIN OBJECT
# =====================================================================================================================
def default_notify_all(data):
    """
        Default delegate used by the core for notification.
    """
    print(str(data))


async def default_notify_all_co(data):
    """
        Default async delegate used by the core for notification.
    """
    await asyncio.sleep(0)
    print(str(data))


class Core:
    version = ABSG_CORE_VERSION
    db_version = ABSG_DB_VERSION

    def __init__(self):
        # Check that db major version is compatible with application version
        db_version = execute("SELECT value FROM parameter WHERE key='database_version'").first()[0]
        if db_version.split(".")[0] != ABSG_DB_VERSION:
            raise AbsgException("The database version ({}) is not complient with the absg application source code ({}).".format(db_version, ABSG_DB_VERSION))
        else:
            log("DB version check success: {}".format(db_version))


        # Notify all method
        # according to api that will be pluged on the core, this method should be overriden 
        # (See how api_rest override this method in api_rest/rest.py)
        self.notify_all = default_notify_all
        self.notify_all_co = default_notify_all_co
    

    def user_authentication(self, login, pwd):
        """
            Return the User if credential match.
        """
        return User.from_credential(login, pwd);






# =====================================================================================================================
# INIT OBJECTS
# =====================================================================================================================

core = Core()

