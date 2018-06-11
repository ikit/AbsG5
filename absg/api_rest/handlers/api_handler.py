#!env/python3
# coding: utf-8
import ipdb


import os
import json
import aiohttp
import aiohttp_jinja2
import datetime
import time
import requests

import aiohttp_security
from aiohttp_session import get_session
from aiohttp_security import remember, forget, authorized_userid, permits

import asyncio
import functools
import inspect
from aiohttp import web
from urllib.parse import parse_qsl

from config import *
from core.framework.common import *
from core.model import *
from core.core import core
from api_rest.rest import *
 





# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# API/MISC HANDLER
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
class ApiHandler:
    def __init__(self):
        pass

    
    @user_role('Authenticated')
    def welcome(self, request):
        """
            Get all data to init/refresh data client side
            /!\ Result answer may be heavy
        """

        result = {
            # "analyses": core.analyses.list(),
            # "subjects": core.subjects.list(),
            # "samples": core.samples.list(),
            # "projects": core.projects.list(),
            # "panels": core.panels.list(),
            # "pipelines": core.pipelines.list(),
            # "jobs": core.jobs.list(),
            # "users": core.users.list(),
            # "last_events": core.events.list(),
            # "last_analyses": self.get_last_analyses(),
            # "last_subjects" : self.get_last_subjects(),
            # "references" : [{"id": ref[0], "name": ref[1]} for ref in core.annotations.ref_list.items()]
        }
        return rest_success(check_local_path(result))



    def config(self, request):
        """
            Return the server configuration and planned milestones for server and official client
        """
        # Retrieve github informations
        response = requests.get("https://api.github.com/repos/ikit/Girouette/milestones")
        cdata = False
        if response.ok:
            cdata = json.loads(response.content.decode())
        response = requests.get("https://api.github.com/repos/ikit/Absg5/milestones")
        sdata = False
        if response.ok:
            sdata = json.loads(response.content.decode())

        # Get message
        sql = "SELECT value FROM parameter WHERE key = 'message'"
        message = {"type": "info", "message": ""}
        for res in execute(sql):
            message = json.loads(res.value)

        return rest_success({
            "website": "http://dev.absolumentg.fr",
            "version" : core.version,
            "db_version": core.db_version,
            "host" : HOST_P,
            "pagination_default_range": RANGE_DEFAULT,
            "pagination_max_range": RANGE_MAX,
            "server_milestones" : sdata,
            "client_milestones" : cdata,
            "message": message
            })
    
    
    
    @aiohttp_jinja2.template('api_test.html')
    def api(self, request):
        return {
            "version" : core.version,
            "hostname" : HOST_P
        }
    








