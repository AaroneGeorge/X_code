```markdown:README.md
# Twitter Bot

A Python-based Twitter Bot that provides an easy-to-use interface for Twitter API operations using Tweepy.

## Features

- 🐦 Send single tweets
- 🧵 Create tweet threads
- 🗑️ Delete tweets
- 📝 Comprehensive logging
- 🔐 Secure credential management
- ⚡ Error handling and validation

## Prerequisites

- Python 3.7+
- Twitter Developer Account
- Twitter API Credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/finlaymh/twitter-bot.git
cd twitter-bot
```

2. Install required packages:
```bash
pip install tweepy python-dotenv
```

3. Create a `.env` file in the root directory with your Twitter API credentials:
```env
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

## Usage

### Basic Usage

```python
from twitter_bot import TwitterBot

# Initialize the bot
bot = TwitterBot()

# Send a single tweet
bot.send_tweet("Hello, World!")

# Create a thread
messages = [
    "This is tweet 1 🎉",
    "This is tweet 2 📚",
    "This is tweet 3 🎯"
]
bot.create_thread(messages)

# Delete a tweet
bot.delete_tweet("tweet_id")
```

### Advanced Usage

```python
# Custom .env file path
bot = TwitterBot(env_path="path/to/custom/.env")

# Error handling
try:
    tweet = bot.send_tweet("My tweet message")
    if tweet:
        print(f"Tweet posted successfully! Tweet ID: {tweet['id']}")
except Exception as e:
    print(f"Error: {str(e)}")
```

## API Reference

### TwitterBot Class

#### `__init__(env_path: Union[str, Path] = '.env')`
Initializes the TwitterBot with credentials from the specified .env file.

#### `send_tweet(message: str) -> Optional[Dict]`
Sends a single tweet.
- **Parameters:**
  - `message`: The tweet text (max 280 characters)
- **Returns:** Dictionary containing tweet data if successful, None otherwise

#### `create_thread(messages: list[str]) -> list[Optional[Dict]]`
Creates a thread of connected tweets.
- **Parameters:**
  - `messages`: List of messages for each tweet in the thread
- **Returns:** List of tweet data dictionaries

#### `delete_tweet(tweet_id: str) -> bool`
Deletes a specific tweet.
- **Parameters:**
  - `tweet_id`: ID of the tweet to delete
- **Returns:** True if successful, False otherwise

## Error Handling

The bot includes comprehensive error handling for common scenarios:
- Invalid credentials
- Missing .env file
- Network errors
- Rate limiting
- Tweet length validation
- API access level restrictions

## Logging

The bot uses Python's built-in logging module to provide detailed operation logs:
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```README.md

## NOTE

https://api.radar.io/v1/users/settings/channels/callback/twitter-v2-self-owned

https://www.radar.io
