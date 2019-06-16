
microkernel-mod-alasql
======================

Microkernel module for integrating the AlaSQL database.

<p/>
<img src="https://nodei.co/npm/microkernel-mod-alasql.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/microkernel-mod-alasql.png" alt=""/>

About
-----

This is an extension module for the
[Microkernel](http://github.com/rse/microkernel) server
application environment, adding the capability to seamlessly
integrate the AlaSQL database.

Usage
-----

```shell
$ npm install microkernel
$ npm install microkernel-mod-ctx microkernel-mod-logger
$ npm install microkernel-mod-alasql
```

```js
var Microkernel = require("microkernel")
var kernel = new Microkernel()

kernel.load([ "microkernel-mod-alasql", { database: "database.json" } ])

kernel.add(class ExampleModule {
    get module () {
        return {
            name:  "example",
            after: [ "ALASQL" ]
        }
    }
    latch (kernel) {
        kernel.latch("alasql:ddl", (ddl) => {
            ddl.sql +=
                `CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT);
                 INSERT INTO users VALUES ("admin", ?);`
            ddl.args.push("admin")
        })
    }
    start (kernel) {
        kernel.register("isValidUser", (username) => {
            return kernel.rs("alasql")
                .queryOne("SELECT 1 FROM users WHERE username = ?", [ username ])
                .then((result) => {
                    return (result !== null)
                })
        })
    }
})
```

License
-------

Copyright (c) 2016-2019 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

