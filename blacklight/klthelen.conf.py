# See https://docs.gunicorn.org/en/stable/settings.html
# import multiprocessing

#user = 'nginx'
user = 'klthelen'
certfile = '/etc/ssl/certs/bundle.crt'
keyfile = '/etc/ssl/private/key.key'

wsgi_app = 'wsgi:app'

bind = 'localhost:6001'
#bind = 'unix:/var/www/blacklight/blacklight.sock'

# umask = 0o007

#bind = 'unix:/home/klthelen/Senna/Prod/blacklight/blacklight.sock'
#bind = '0.0.0.0:6001'
#bind = 'illuminated.cs.mtu.edu:6000'

reload = True


