# chat-app

# Initial Setup
`docker run -d -p 4100:3000 -p 4106:3306 --name "sosa-bot" --rm -v "E:/Development/sosa-chat-bot/bot/":/var/www/html:Z -t sosa/chat`
`docker exec -w /var/www/html -it sosa-bot npm install`

Note: Make sure to rename `examples/message_database_example.db` to `examples/message_database.db` before running! 

# Run Repeater Bot
From Windows command line with the docker instance running
`docker exec -it sosa-bot node /var/www/html/RepeaterBots.js`

# Access instance bash
`docker exec -it sosa-bot bash`
