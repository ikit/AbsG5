# Docker manual command
# docker run -a stdin -a stdout -it -v /var/absg5:/var/absg:rw -v /home/olivier/git/AbsG5/install/../absg:/var/absg_app:rw -w /var/absg_app --network absg5_net -p 8600:8600 --name absg5_app absg_img python absg.py

start:
	docker start absg5_app


debug:
	docker start -ai absg5_app


stop:
	docker stop absg5_app

pp:
	docker rm -f absg_debug || true
	docker run -a stdin -a stdout -it -v /var/absg5:/var/absg:rw -v /home/olivier/git/AbsG5/install/../absg:/var/absg_app:rw -w /var/absg_app --network absg5_net -p 8600:8600 --name absg_debug absg sh




#Database utils
terminate_queries:
	docker exec absg5_pg psql -U absg -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'absg'"



list_db:
	docker exec absg5_pg psql -U absg -d absg -c "SELECT relname as Table, pg_size_pretty(pg_total_relation_size(relid)) As Size, pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as ExternalSize, rowcount as RowCount \
    FROM pg_catalog.pg_statio_user_tables  \
    LEFT JOIN ( \
        SELECT table_name, n_tup_ins - n_tup_del as rowcount  \
        FROM (SELECT DISTINCT table_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name) AS _t  \
        LEFT JOIN pg_stat_all_tables ON table_name=relname ORDER BY table_name) AS _sub ON table_name=relname \
    ORDER BY table_name ASC"


#Tests
test:
	test -n $(database_name)
	sudo -u postgres psql -c "DROP DATABASE IF EXISTS $(database_name)_test"
	psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""
	sudo -u postgres psql -c "CREATE DATABASE $(database_name)_test OWNER absg"
	psql -U absg -d $(database_name)_test -f ../install/create_all.sql
	psql -U absg -d $(database_name)_test -f tests/init_fake_data.sql
	sed -i.bak 's/^\(\s*DATABASE_NAME\s*=\s*"[^"]\+\)\(".*\)/\1_test\2/' config.py
	coverage run tests.py
	coverage report
	mv config.py config.test
	mv config.py.bak config.py
	sudo -u postgres psql -c "DROP DATABASE IF EXISTS $(database_name)_test"


.PHONY: start list_db test
