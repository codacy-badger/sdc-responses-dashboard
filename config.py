import os
import time

from structlog import get_logger

logger = get_logger()

REQUIRED_ENVIRONMENT_VARIABLES = {
    'PORT',
    'HOST',
    'COLLECTION_EXERCISE_URL',
    'SURVEY_URL',
    'REPORTING_URL',
    'REPORTING_REFRESH_CYCLE_IN_SECONDS',
    'AUTH_USERNAME',
    'AUTH_PASSWORD',
    'STATIC_ASSETS_VERSION'
}


def read_file(file_name):
    if file_name and os.path.isfile(file_name):
        logger.debug('reading from file', filename=file_name)
        with open(file_name, 'r') as file:
            contents = file.read()
            return contents
    else:
        logger.info('Did not load file because filename supplied was None or not a file', filename=file_name)
        return None


class Config:
    DEBUG = os.getenv('DEBUG', False)
    PORT = os.getenv('PORT')
    HOST = os.getenv('HOST')
    COLLECTION_EXERCISE_URL = os.getenv('COLLECTION_EXERCISE_URL')
    SURVEY_URL = os.getenv('SURVEY_URL')
    REPORTING_URL = os.getenv('REPORTING_URL')
    REPORTING_REFRESH_CYCLE_IN_SECONDS = os.getenv('REPORTING_REFRESH_CYCLE_IN_SECONDS')
    AUTH_USERNAME = os.getenv('AUTH_USERNAME')
    AUTH_PASSWORD = os.getenv('AUTH_PASSWORD')
    LOGGING_LEVEL = os.getenv('LOGGING_LEVEL', 'INFO')
    LOGGING_JSON_INDENT = os.getenv('LOGGING_JSON_INDENT')
    STATIC_ASSETS_VERSION = read_file(os.path.join(os.path.dirname(__file__), '.static_assets_version'))



class DevelopmentConfig(Config):
    DEBUG = os.getenv('DEBUG', True)
    PORT = os.getenv('PORT', '5000')
    HOST = os.getenv('HOST', 'localhost')
    ENV = os.getenv('FLASK_ENV', 'development')
    COLLECTION_EXERCISE_URL = os.getenv('COLLECTION_EXERCISE_URL', 'http://localhost:8145')
    SURVEY_URL = os.getenv('SURVEY_URL', 'http://localhost:8080')
    REPORTING_URL = os.getenv('REPORTING_URL', 'http://localhost:8084')
    REPORTING_REFRESH_CYCLE_IN_SECONDS = os.getenv('REPORTING_REFRESH_CYCLE_IN_SECONDS', '10')
    AUTH_USERNAME = os.getenv('AUTH_USERNAME', 'admin')
    AUTH_PASSWORD = os.getenv('AUTH_PASSWORD', 'secret')
    LOGGING_LEVEL = os.getenv('LOGGING_LEVEL', 'DEBUG')
    LOGGING_JSON_INDENT = os.getenv('LOGGING_JSON_INDENT', '4')
    STATIC_ASSETS_VERSION = os.getenv('STATIC_ASSETS_VERSION', str(int(time.time())))


class TestingConfig(Config):
    testing_url = 'http://test'
    COLLECTION_EXERCISE_URL = testing_url
    SURVEY_URL = testing_url
    REPORTING_URL = testing_url
    PORT = '5000'
    HOST = 'localhost'
    TESTING = True
    ENV = 'testing'
    REPORTING_REFRESH_CYCLE_IN_SECONDS = '10'
    AUTH_USERNAME = 'admin'
    AUTH_PASSWORD = 'secret'
    STATIC_ASSETS_VERSION = 'test'
