# podcastdl
Download podcast audio files and general info from a podcast RSS feed. Not optimized. It does what it does for me, albeit not in the most speedy fashion.

## CLI usage
```bash
podcastdl --url https://foo.bar
# basic usage, download the podcast feed to the default folder "out"

podcastdl --url https://foo.bar --output a-folder --verbose
# download the podcast feed to the folder "a-folder" and show more logs
```

### Options
```
url: the url of the podcast feed
--url or -u

output: the folder to save the podcast files
--output or -o

verbose: show more logs
--verbose or -v

help: show this help
--help or -h
```

## API usage
```javascript
import downloader from "./index.js"
downloader("https://app.springcast.fm/podcast-xml/16731", "out", true)
```
