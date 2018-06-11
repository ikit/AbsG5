#!env/python3
# coding: utf-8

import aiohttp_jinja2
import jinja2
import base64

from aiohttp import web
from aiohttp_session import setup as setup_session
from aiohttp_session.cookie_storage import EncryptedCookieStorage
from aiohttp_security import setup as setup_security
from aiohttp_security import SessionIdentityPolicy

from config import *
from api_rest.policy import AbsgAuthorizationPolicy
from api_rest.rest import *
from api_rest.handlers import *


# Handlers instances
apiHandler = ApiHandler()
userHandler = UserHandler()
fileHdl = FileHandler()

websocket = WebsocketHandler()


# Create a auth ticket mechanism that expires after SESSION_MAX_DURATION seconds (default is 86400s = 24h), and has a randomly generated secret. 
# Also includes the optional inclusion of the users IP address in the hash
key = base64.b64encode(PRIVATE_KEY32.encode()).decode()


# Create server app
app = web.Application()
setup_session(app, EncryptedCookieStorage(key, max_age=SESSION_MAX_DURATION))
setup_security(app, SessionIdentityPolicy(session_key='absg_session_token'), AbsgAuthorizationPolicy())
app['websockets'] = []
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(TEMPLATE_DIR)) 

# On shutdown, close all websockets
app.on_shutdown.append(on_shutdown)






# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# ROUTES
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
app.router.add_route('GET',    "/",       apiHandler.welcome)                                                     # Get "welcom page of the rest API"
app.router.add_route('GET',    "/config", apiHandler.config)                                                     # Get config of the server
app.router.add_route('GET',    "/api",    apiHandler.api)                                                        # Get html test api page
app.router.add_route('GET',    "/ws",     websocket.get)                                                         # Websocket url to use with ws or wss protocol


app.router.add_route('GET',    "/user", userHandler.list)                                                        # Get list of all users (allow search parameters)
app.router.add_route('POST',   "/user", userHandler.new)                                                         # Create new users with provided data
app.router.add_route('GET',    "/user/{user_id}", userHandler.get)                                               # Get details about one user
app.router.add_route('PUT',    "/user/{user_id}", userHandler.edit)                                              # Edit user with provided data
app.router.add_route('POST',   "/user/login", userHandler.login)                                                 # Start user's session if provided credentials are correct
app.router.add_route('GET',    "/user/logout", userHandler.logout)                                               # Kill user's session
app.router.add_route('DELETE', "/user/{user_id}", userHandler.delete)                                            # Delete a user

app.router.add_route('GET',    "/file",                  fileHdl.list)                                           # Get list of all file (allow search parameters)
app.router.add_route('GET',    "/file/{file_id}",        fileHdl.get)                                            # Get details about a file
app.router.add_route('PUT',    "/file/{file_id}",        fileHdl.edit)                                           # Edit file's details
app.router.add_route('DELETE', "/file/{file_id}",        fileHdl.delete)                                         # Delete the file
app.router.add_route('POST',   "/file/upload",           fileHdl.tus_upload_init)
app.router.add_route('OPTIONS',"/file/upload",           fileHdl.tus_config)
app.router.add_route('HEAD',   "/file/upload/{file_id}", fileHdl.tus_upload_resume)
app.router.add_route('PATCH',  "/file/upload/{file_id}", fileHdl.tus_upload_chunk)
app.router.add_route('DELETE', "/file/upload/{file_id}", fileHdl.tus_upload_delete)





# Statics root for direct download
# FIXME - Routes that should be manages directly by NginX
#app.router.add_static('/error', TEMPLATE_DIR + "/errors/")
app.router.add_static('/assets', TEMPLATE_DIR)
app.router.add_static('/dl/file/', FILES_DIR)
app.router.add_static('/cache/', CACHE_DIR)


