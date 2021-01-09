/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2016-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  internal requirements  */
const path   = require("path")

/*  external requirements  */
const fs     = require("mz/fs")
const AlaSQL = require("alasql")

/*  the Microkernel module  */
class Module {
    constructor (options) {
        /*  allow database to be configured initially  */
        this.options = Object.assign({
            database: null
        }, options || {})
    }
    get module () {
        /*  identify this module  */
        return {
            name:  "microkernel-mod-alasql",
            tag:   "ALASQL",
            group: "BASE"
        }
    }
    latch (kernel) {
        /*  allow database to be overridden on command-line  */
        const database = this.options.database !== null ?
            this.options.database :
            path.join(kernel.rs("ctx:datadir"), kernel.rs("ctx:program") + ".json")
        kernel.latch("options:options", (options) => {
            options.push({
                name: "database", type: "string", "default": database,
                help: "use JSON file for database", helpArg: "FILE"
            })
        })
    }
    async start (kernel) {
        /*  provide convenience database API  */
        const db = {
            query (...args) {
                return AlaSQL.promise(...args)
            },
            queryOne (...args) {
                return this.query(...args).then((result) => {
                    if (result.length > 1)
                        throw new Error("more than one result found")
                    return (result.length === 1 ? result[0] : null)
                })
            }
        }
        kernel.rs("alasql", db)

        /*  establish database  */
        let ddl
        const database = kernel.rs("options:options").database + ""
        const exists = await fs.exists(database)
        if (!exists) {
            /*  create new database  */
            ddl = {
                sql: `CREATE FILESTORAGE DATABASE db("${database}");
                      ATTACH FILESTORAGE DATABASE db("${database}");
                      USE DATABASE db;`,
                args: [ ]
            }
            kernel.hook("alasql:ddl", "pass", ddl)
        }
        else
            /*  use existing database  */
            ddl = {
                mode: "attach",
                sql: `ATTACH FILESTORAGE DATABASE db("${database}");
                      USE DATABASE db;`,
                args: [ ]
            }
        await db.query(ddl.sql, ddl.args)
    }
}

/*  export the Microkernel module  */
module.exports = Module

