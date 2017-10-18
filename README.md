# BruteJS: Fast web path fuzzer.

BruteJS is a fast web path fuzzer. At this time it's faster than dirb and wfuzz.

#### How much faster is compared with WFuzz or Dirb?:

Using dirb's big.txt dictionary (300 Mbps bandwith internet connection):

| Script | Time to finish |
|----------|---------|
| Dirb   |  17 minutes 4 seconds   |
| Wfuzz   | 1 minute 40 seconds   |
| BruteJS   | 41 seconds   |

Which means, BruteJS performs 127% faster than WFuzz and 2218% faster than Dirb

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