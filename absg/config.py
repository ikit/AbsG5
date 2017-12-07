#!env/python3
# coding: utf-8 
import os


DEBUG = True


# HOST (internal)
HOST = "127.0.0.1"
PORT = 9000
VERSION = "5.0.dev"
HOSTNAME = "{}:{}".format(HOST, PORT)  # This is the internal host on which aioHTTP will run the service.
# HOST (public)
HOST_P = "dev.absolumentg.fr"  # THIS url must be change if the annso server is reach via a public namespace that user




# SECURITY
PRIVATE_KEY32 = "723c88d556b150effbafca7c1d1b2f9f" # 32bits server secret key, default generated with $ date | md5sum
SESSION_MAX_DURATION = 86400



# DB
DATABASE_HOST = "localhost"
DATABASE_PORT = 5432
DATABASE_USER = "absg"
DATABASE_PWD = "absg"
DATABASE_NAME = "absg" # _test_test_test_test_test_test_test"
DATABASE_POOL_SIZE = 7


# FILESYSTEM
FILES_DIR = "/var/absg/files"
TEMP_DIR = "/var/absg/downloads"
CACHE_DIR = "/var/absg/cache"
DATABASES_DIR = "/var/absg/databases"
PIPELINES_DIR = "/var/absg/pipelines"
JOBS_DIR = "/var/absg/jobs"





# AUTOCOMPUTED VALUES
REGOVAR_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = REGOVAR_DIR
TEMPLATE_DIR = os.path.join(REGOVAR_DIR, "api_rest/templates/")
ERROR_ROOT_URL = "{}/errorcode/".format(HOST_P)
NOTIFY_URL = "http://" + HOST_P + "/job/{}/notify"








# REST API
RANGE_DEFAULT = 100
RANGE_MAX = 1000




#
# ANNSO modules
#
DEFAULT_REFERENCIAL_ID = 2 # hg19







#
# CONTAINER CONFIG (PIRUS)
#

PIRUS_UID = 1000
PIRUS_GID = 1000
LXD_UID = 165537
LXD_GID = 165537

PIPELINE_DEFAULT_ICON_PATH = os.path.join(TEMPLATE_DIR , "pipeline_icon.png")
MAX_JOB_RUNNING = 5


# CONTAINER'S TECHNOLOGIES SPECIFICS CONFIG

CONTAINERS_CONFIG = {
    "lxd" : {
        "pirus_uid" : PIRUS_UID,
        "pirus_gid" : PIRUS_GID,
        "lxd_uid" : LXD_UID,
        "lxd_gid" : LXD_GID,
        "job_name" : "pirus-job-{}",
        "image_name" : "pirus-pipe-{}",
        "manifest" : {
            "mandatory" : {
                "name"        : "The displayed name of the pirus pipeline",
                "job"         : "The command line that will executed by pirus to run the pipeline.",
            },
            "default" : {
                "pirus_api"   : VERSION,               # The version of the pirus api used by the pipeline
                "inputs"      : "/pipeline/inputs",    # The absolute path in the pipeline lxd container to the directory where input files have to be mount.
                "outputs"     : "/pipeline/outputs",   # The absolute path in the pipeline lxd container to the directory where output files will be write.
                "logs"        : "/pipeline/logs",      # The absolute path in the pipeline lxd container to the directory where logs files will be write. Note that out.log, err.log and pirus.log will be automatically created in this directory.
                "databases"   : "/pipeline/databases", # The absolute path in the pipeline lxd container to the directory where common databases have to be mount.
                "documents"   : [],                    # This of absolute path to documents of the pipe. Recommanded file name are : "form.json", "icon.png", "help.html", "changelog" and "license"
            }
        }
    },
    "regovar_import": {
        
    }
}
