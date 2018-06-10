#!python
# coding: utf-8

import os



# Regovar package
from config import *
from core.framework.common import AbsgException, err

# Some check before starting the web application
if not os.path.exists(TEMPLATE_DIR):
    raise AbsgException("ERROR : Templates directory doesn't exists : " + TEMPLATE_DIR)
if not os.path.exists(CACHE_DIR):
    raise AbsgException("ERROR : Cache directory doesn't exists : " + CACHE_DIR)
if not os.path.exists(TEMP_DIR):
    raise AbsgException("ERROR : Temp directory for file upload doesn't exists : " + TEMP_DIR)
if not os.path.exists(FILES_DIR):
    raise AbsgException("ERROR : File directory doesn't exists : " + FILES_DIR)

# Load rest of pirus application shall be done after celery init
from aiohttp import web
from api_rest import *



# Start the absg server
if __name__ == '__main__':
    try:
        web.run_app(app, host=HOST, port=PORT)
    except Exception as ex:
        err("Uncatched exception", ex)