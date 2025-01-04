import os
import logging
import tweepy
from typing import Optional, Union, Dict
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TwitterBot:
    """A class to handle Twitter API operations"""
    
    def __init__(self, env_path: Union[str, Path] = '.env'):
        """
        Initialize the TwitterBot with credentials from .env file
        
        Args:
            env_path: Path to the .env file (default: '.env')
        """
        self._load_credentials(env_path)
        self._initialize_client()

    def _load_credentials(self, env_path: Union[str, Path]) -> None:
        """Load credentials from .env file"""
        try:
            load_dotenv(env_path, override=True)
            self.api_key = os.getenv('TWITTER_API_KEY')
            self.api_secret = os.getenv('TWITTER_API_SECRET')
            self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
            self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
            self.bearer_token = os.getenv('TWITTER_BEARER_TOKEN')

            # Verify all credentials are present
            if not all([self.api_key, self.api_secret, self.access_token, 
                       self.access_token_secret, self.bearer_token]):
                raise ValueError("Missing required credentials in .env file")

        except Exception as e:
            logger.error(f"Failed to load credentials: {str(e)}")
            raise

    def _initialize_client(self) -> None:
        """Initialize Twitter API client"""
        try:
            self.client = tweepy.Client(
                bearer_token=self.bearer_token,
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret
            )
            # Verify authentication
            self.me = self.client.get_me()
            logger.info(f"Authentication successful! Logged in as: {self.me.data.username}")
        except Exception as e:
            logger.error(f"Failed to initialize Twitter client: {str(e)}")
            raise

    def send_tweet(self, message: str) -> Optional[Dict]:
        """
        Send a tweet
        
        Args:
            message: The tweet message to be sent
            
        Returns:
            Dict containing tweet data if successful, None otherwise
        """
        try:
            # Validate tweet length
            if len(message) > 280:
                raise ValueError("Tweet exceeds 280 characters")

            tweet = self.client.create_tweet(text=message)
            logger.info(f"Tweet posted successfully: {message}")
            return tweet.data

        except tweepy.errors.Forbidden as e:
            logger.error(f"Access level error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error posting tweet: {str(e)}")
            return None

    def create_thread(self, messages: list[str]) -> list[Optional[Dict]]:
        """
        Create a thread of tweets
        
        Args:
            messages: List of messages for the thread
            
        Returns:
            List of tweet data dictionaries
        """
        tweets = []
        previous_tweet_id = None

        try:
            for message in messages:
                if previous_tweet_id:
                    tweet = self.client.create_tweet(
                        text=message,
                        in_reply_to_tweet_id=previous_tweet_id
                    )
                else:
                    tweet = self.client.create_tweet(text=message)

                tweets.append(tweet.data)
                previous_tweet_id = tweet.data['id']
                logger.info(f"Thread tweet posted: {message}")

            return tweets

        except Exception as e:
            logger.error(f"Error creating thread: {str(e)}")
            return tweets  # Return any tweets that were successfully posted

    def delete_tweet(self, tweet_id: str) -> bool:
        """
        Delete a tweet
        
        Args:
            tweet_id: ID of the tweet to delete
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.client.delete_tweet(tweet_id)
            logger.info(f"Tweet {tweet_id} deleted successfully")
            return True
        except Exception as e:
            logger.error(f"Error deleting tweet: {str(e)}")
            return False

def main():
    """Main function to demonstrate TwitterBot usage"""
    try:
        # Initialize bot
        bot = TwitterBot()

        # Example: Send a single tweet
        tweet = bot.send_tweet("Hello, World! This is a test tweet from my optimized Twitter bot!")

        # Example: Create a thread
        thread_messages = [
            "This is the start of a thread! 🧵",
            "Second tweet in the thread! 📚",
            "And this is the final tweet! 🎉"
        ]
        thread = bot.create_thread(thread_messages)

        # Example: Delete a tweet (uncomment to use)
        # if tweet:
        #     bot.delete_tweet(tweet['id'])

    except Exception as e:
        logger.error(f"Main execution failed: {str(e)}")

if __name__ == "__main__":
    main()
