FROM coinpit/nodejs
COPY dist ./dist
RUN cd dist && npm install -production
EXPOSE 8090
CMD node dist/src/index.js
