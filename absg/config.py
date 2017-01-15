#!env/python3
# coding: utf-8 
import os


DEBUG          = True


# HOST
HOST           = "dev1.absolumentg.fr"
PORT           = 8900
VERSION        = "v5"
HOSTNAME       = "{0}:{1}".format(HOST, PORT)

HOST_P         = HOSTNAME

RANGE_DEFAULT = 20
RANGE_MAX     = 100

# DB
DATABASE_HOST = "localhost"
DATABASE_PORT = "5432"
DATABASE_USER = "absg"
DATABASE_PWD  = "absg"
DATABASE_NAME = "absg"



# FILESYSTEM
# FILES_DIR     = "/tmp/absg_" + VERSION + "/files"
# TEMP_DIR      = "/tmp/absg_" + VERSION + "/downloads"
CACHE_DIR     = "/tmp/absg_" + VERSION + "/cache"


# AUTOCOMPUTED VALUES
ABSG_DIR      = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR   = os.path.join(ABSG_DIR, "api_web/templates/")

