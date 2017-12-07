
# Install prerequisits
sudo apt install nginx
sudo apt install build-essential libssl-dev libffi-dev python3-dev virtualenv

# Install postgresql
sudo apt install postgresql


# Create user & database
psql -U postgres -c "CREATE USER absg WITH PASSWORD 'absg';"
psql -U postgres -c "DROP DATABASE IF EXISTS absg;"
psql -U postgres -c "CREATE DATABASE absg;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE absg to absg;"



# Create virtual environment
git clone https://github.com/ikit/absg5.git
cd absg5
virtualenv -p /usr/bin/python3.5 venv
source venv/bin/activate
pip install -r requirements.txt
cd absg/database
psql -U absg -d absg -f create_all.sql