FROM mongo:8.0

COPY mongo-entrypoint.sh /usr/local/bin/mongo-entrypoint.sh
RUN chmod +x /usr/local/bin/mongo-entrypoint.sh

ENTRYPOINT ["mongo-entrypoint.sh"]
