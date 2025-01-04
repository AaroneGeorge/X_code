const { TwitterApi } = require('twitter-api-v2');
const dotenv = require('dotenv');
const path = require('path');
const winston = require('winston');

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} - ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

class TwitterBot {
    /**
     * Initialize the TwitterBot with credentials from .env file
     * @param {string} envPath - Path to the .env file
     */
    constructor(envPath = '.env') {
        this._loadCredentials(envPath);
        this._initializeClient();
    }

    /**
     * Load credentials from .env file
     * @private
     * @param {string} envPath - Path to the .env file
     */
    _loadCredentials(envPath) {
        try {
            dotenv.config({ path: path.resolve(envPath), override: true });
            
            this.apiKey = process.env.TWITTER_API_KEY;
            this.apiSecret = process.env.TWITTER_API_SECRET;
            this.accessToken = process.env.TWITTER_ACCESS_TOKEN;
            this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
            this.bearerToken = process.env.TWITTER_BEARER_TOKEN;

            // Verify all credentials are present
            if (!this.apiKey || !this.apiSecret || !this.accessToken || 
                !this.accessTokenSecret || !this.bearerToken) {
                throw new Error("Missing required credentials in .env file");
            }
        } catch (error) {
            logger.error(`Failed to load credentials: ${error.message}`);
            throw error;
        }
    }

    /**
     * Initialize Twitter API client
     * @private
     */
    async _initializeClient() {
        try {
            this.client = new TwitterApi({
                appKey: this.apiKey,
                appSecret: this.apiSecret,
                accessToken: this.accessToken,
                accessSecret: this.accessTokenSecret,
            });

            // Verify authentication
            const me = await this.client.v2.me();
            logger.info(`Authentication successful! Logged in as: ${me.data.username}`);
        } catch (error) {
            logger.error(`Failed to initialize Twitter client: ${error.message}`);
            throw error;
        }
    }

    /**
     * Send a tweet
     * @param {string} message - The tweet message to be sent
     * @returns {Promise<Object|null>} Tweet data if successful, null otherwise
     */
    async sendTweet(message) {
        try {
            // Validate tweet length
            if (message.length > 280) {
                throw new Error("Tweet exceeds 280 characters");
            }

            const tweet = await this.client.v2.tweet(message);
            logger.info(`Tweet posted successfully: ${message}`);
            return tweet.data;
        } catch (error) {
            if (error.code === 403) {
                logger.error(`Access level error: ${error.message}`);
            } else {
                logger.error(`Error posting tweet: ${error.message}`);
            }
            return null;
        }
    }

    /**
     * Create a thread of tweets
     * @param {string[]} messages - List of messages for the thread
     * @returns {Promise<Array>} List of tweet data
     */
    async createThread(messages) {
        const tweets = [];
        let previousTweetId = null;

        try {
            for (const message of messages) {
                const tweetOptions = previousTweetId 
                    ? { reply: { in_reply_to_tweet_id: previousTweetId } }
                    : {};

                const tweet = await this.client.v2.tweet(message, tweetOptions);
                tweets.push(tweet.data);
                previousTweetId = tweet.data.id;
                logger.info(`Thread tweet posted: ${message}`);
            }

            return tweets;
        } catch (error) {
            logger.error(`Error creating thread: ${error.message}`);
            return tweets; // Return any tweets that were successfully posted
        }
    }

    /**
     * Delete a tweet
     * @param {string} tweetId - ID of the tweet to delete
     * @returns {Promise<boolean>} True if successful, False otherwise
     */
    async deleteTweet(tweetId) {
        try {
            await this.client.v2.deleteTweet(tweetId);
            logger.info(`Tweet ${tweetId} deleted successfully`);
            return true;
        } catch (error) {
            logger.error(`Error deleting tweet: ${error.message}`);
            return false;
        }
    }
}

// Example usage
async function main() {
    try {
        // Initialize bot
        const bot = new TwitterBot();

        // Example: Send a single tweet
        const tweet = await bot.sendTweet("Hello, World! This is a test tweet from my optimized Twitter bot!");

        // Example: Create a thread
        const threadMessages = [
            "This is the start of a thread! 🧵",
            "Second tweet in the thread! 📚",
            "And this is the final tweet! 🎉"
        ];
        const thread = await bot.createThread(threadMessages);

        // Example: Delete a tweet (uncomment to use)
        // if (tweet) {
        //     await bot.deleteTweet(tweet.id);
        // }
    } catch (error) {
        logger.error(`Main execution failed: ${error.message}`);
    }
}

// Run the main function if this file is run directly
if (require.main === module) {
    main();
}

module.exports = TwitterBot; 