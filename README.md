# chat-bot

# Initial Setup
`docker run -d -p 4100:3000 -p 4106:3306 --name "sosa-bot" --rm -v "E:/Development/sosa-bot/bot/":/var/www/html:Z -t sosa/chat`
`docker exec -w /var/www/html -it sosa-bot npm install`

# Run
From Windows command line with the docker instance running
`docker exec -it sosa-chat node /var/www/html/app.js`

# Access instance bash
`docker exec -it sosa-chat bash`
