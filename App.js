const express = require('express')
const app = express()

//admin routes
const adminPageRoutes = require('./routes/admin/adminPageRoutes')
const adminEventRoutes = require('./routes/admin/adminEventRoutes')
const adminUserRoutes = require('./routes/admin/adminUserRoutes')
const adminReportRoutes = require('./routes/admin/adminReportRoutes')

//user routes
const userPageRoutes = require('./routes/user/userPageRoutes')
const userEventRoutes = require('./routes/user/userEventRoutes')
const userProfileRoutes = require('./routes/user/userProfileRoutes')


app.use("/", adminPageRoutes)
app.use("/", adminEventRoutes)
app.use("/", adminUserRoutes)
app.use("/", adminReportRoutes)

app.use("/", userPageRoutes)
app.use("/", userEventRoutes)
app.use("/", userProfileRoutes)

app.listen(3000)