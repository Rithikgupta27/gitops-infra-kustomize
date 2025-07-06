FROM mysql:8.0

# Set env vars for root password and default DB
ENV MYSQL_ROOT_PASSWORD=pass
ENV MYSQL_DATABASE=mysql1.0

EXPOSE 3306
# Add init SQL scripts
COPY init.sql /docker-entrypoint-initdb.d/
