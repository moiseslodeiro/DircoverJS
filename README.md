# DircoverJS: Fast web path fuzzer with passive recognition.

BruteJS is a fast web path fuzzer. At this time it's faster than dirb and wfuzz.

#### How much faster is compared with WFuzz or Dirb?:

Using dirb's big.txt dictionary (300 Mbps bandwith internet connection and 150 simultanous sockets):

| Script | Time to finish |
|----------|---------|
| Dirb   |  ~17 minutes   |
| Wfuzz   | ~1 minute 40 seconds   |
| DircoverJS   | ~10 seconds   |


#### Requires:
| Software | Version |
|----------|---------|
| NodeJS   | Tested on 8.7.0   |

#### Usage example:

```sh
node main.js -u "http://www.hostname.com/" -w "wordlists/common.txt" -s 150
```

Use passive recognition:

```sh
node main.js -u "http://www.hostname.com/" -w "wordlists/common.txt" -s 150 -p
```

Use ONLY passive recognition:

```sh
node main.js -u "http://www.hostname.com/" -ponly
```


#### Author:
Gonzalo García: [LinkedIn](https://www.linkedin.com/in/gongl556/)

#### Collaborators:
Hector Rodriguez.

#### Special thanks to:
Danigargu for the request library idea.
