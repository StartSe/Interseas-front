FROM nginx:alpine AS web

RUN apk add --no-cache nodejs yarn

COPY ./build/nginx.conf /etc/nginx/nginx.conf

COPY ./build/dev-entrypoint.sh /dev-entrypoint.sh
RUN chmod +x /dev-entrypoint.sh

COPY ./flowise-embed/package.json /app/flowise-embed/package.json
COPY ./flowise-embed/yarn.lock /app/flowise-embed/yarn.lock

WORKDIR /app/flowise-embed

RUN yarn install

EXPOSE 8080

ENTRYPOINT [ "/dev-entrypoint.sh" ]