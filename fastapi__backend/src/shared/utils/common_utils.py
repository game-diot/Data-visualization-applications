
import hashlib
import datetime
import random
import string

def format_datetime(dt:datetime.datetime | None = None) ->str:
	dt = dt or datetime.datetime.now()
	return dt.strftime("%Y-%m-%d %H:%M:%S")

def md5_hash(text:str)->str:
	return hashlib.md5(text.encode("utf-8")).hexdigest()

def random_string(length:int = 8)->str:
	chars = string.ascii_letters + string.digits
	return "".join(random.choice(chars) for _ in range (length))