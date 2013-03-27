koko
====

instant file server (proxy server).

Koko start server on port picked randomly,
and current directory is set as document root.

### Install
```bash
% npm install -g koko
```

### usage
```bash
% cd your/document/root
% koko
document root : your/document/root
[listen 59733]
```

or, with path

```bash
% koko your/document/root
document root : your/document/root
[listen 1835]
```

### option

with -o, Koko auto open url on browser.

```bash
% koko -o your/document/root
document root : your/document/root
[listen 4797]
[open http://localhost:4797]
```

