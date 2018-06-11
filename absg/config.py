#!env/python3
# coding: utf-8 
import os


DEBUG = False


# HOST (internal)
HOST = "0.0.0.0"
PORT = 8600
HOSTNAME = "{}:{}".format(HOST, PORT)  # This is the internal host on which aioHTTP will run the service.
# HOST (public)
HOST_P = "dev.absolumentg.fr"  # This url shall be set with the public namespace used




# SECURITY
PRIVATE_KEY32 = "WwuAiC9gOt9FkKlIZJrbq0HJWOXoglE7" # 32bits server secret key, default generated with $ date | md5sum
SESSION_MAX_DURATION = 86400



# DB
DATABASE_HOST = "absg5_pg"
DATABASE_PORT = 5432
DATABASE_USER = "absg"
DATABASE_PWD = "absg"
DATABASE_NAME = "absg"
DATABASE_POOL_SIZE = 7
VCF_IMPORT_MAX_THREAD = 7


# FILESYSTEM
FILES_DIR = "/var/absg/files"
TEMP_DIR = "/var/absg/downloads"
CACHE_DIR = "/var/absg/cache"

CACHE_EXPIRATION_SECONDS = 2592000 # 30 days = 60*60*24*30



# AUTOCOMPUTED VALUES
ABSG_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_DIR = ABSG_DIR
TEMPLATE_DIR = os.path.join(ABSG_DIR, "api_rest/templates/")
ERROR_ROOT_URL = "{}/errorcode/".format(HOST_P)
NOTIFY_URL = "http://" + HOST_P + "/job/{}/notify"



# REST API
RANGE_DEFAULT = 1000
RANGE_MAX = 10000
