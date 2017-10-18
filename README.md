# BruteJS: Fast web path fuzzer.

BruteJS is a fast web path fuzzer. At this time it's faster than dirb and wfuzz.
#### Requires:
| Software | Version |
|----------|---------|
| NodeJS   | Tested on 8.7.0   |

#### Usage example:

```sh
node brutejs -u "http://www.hostname.com" -w "/usr/share/dirb/wordlists/common.txt" -r 300
```

#### Author:
Gonzalo García: [LinkedIn](https://www.linkedin.com/in/gongl556/)