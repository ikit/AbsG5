#!env/python3
# coding: utf-8

import aiohttp_jinja2
import jinja2
from aiohttp import web

from config import *
from core import absg
from api_web.handlers import *




app = web.Application()
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(TEMPLATE_DIR))	


# Handlers instances
websocket = WebsocketHandler()
website = WebsiteHandler()

# Config server app
app['websockets'] = []

# On shutdown, close all websockets
app.on_shutdown.append(on_shutdown)




# Routes
app.router.add_route('GET',    "/",          website.home)
app.router.add_route('GET',    "/ws",     websocket.get)






# # TUS routes /!\ don't forget to also modify route mapping in handlers for the TUS manager (in handlers.py, search 'tus_manager.route_maping')
# app.router.add_route('POST',   "/tus/upload",           sampleHandler.tus_upload_init)
# app.router.add_route('OPTIONS',"/tus/upload",           sampleHandler.tus_config)
# app.router.add_route('HEAD',   "/tus/upload/{file_id}", sampleHandler.tus_upload_resume)
# app.router.add_route('PATCH',  "/tus/upload/{file_id}",   sampleHandler.tus_upload_chunk)
# app.router.add_route('DELETE', "/tus/upload/{file_id}", sampleHandler.tus_upload_delete)



# DEV/DEBUG - Routes that should be manages directly by NginX
app.router.add_static('/assets', TEMPLATE_DIR)
app.router.add_static('/cache', CACHE_DIR)