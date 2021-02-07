const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

//to post you must use bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static("assets"));

app.get("/", (req, res) => {
  res.end(fs.readFileSync("./instruction.html"));
});

//implement your api here
const myCourses = require('./myCourses.json')
const calgpax = () => {
  let GPAX = myCourses.courses.map(courses => {
    return {
      gpa: Number(courses.gpa) * Number(courses.credit),
      credit: Number(courses.credit)
    }
  }).reduce((sum, courses) => {
    return {
      gpa: courses.gpa + sum.gpa,
      credit: courses.credit + sum.credit
    }

  }, { gpa: 0, credit: 0 })

  if (myCourses.courses.length === 0) {
    myCourses.gpax = 0.00
  }
  
  else
    myCourses.gpax = Number((GPAX.gpa / GPAX.credit).toFixed(2))
  
}


app.get("/courses", (req, res) => {
  res.json({
    success: true,
    data: myCourses
  });
});

app.get("/courses/:id", (req, res) => {
  const { id } = req.params
  const FindId = myCourses.courses.find(courses => courses.courseId === +id
  )
  //+id format to int
  if (FindId) {
    res.status(200).json({
      success: true,
      data: FindId
    });
  }
  else {
    res.status(404).json({
      success: false,
      data: null
    });
  }
});

app.delete("/courses/:id", (req, res) => {
  const { id } = req.params
  const FindId = myCourses.courses.findIndex(courses => courses.courseId === +id)
  //+id format to int sameas Number(id)

  if (FindId === -1) {
    res.status(404).json({
      success: false,
      data: myCourses
    });
  }
  else {
    // const DeleteId = myCourses.courses.filter(courses => courses.courseId !== +id)
    myCourses.courses.splice(FindId, 1)  //ตัด id ที่จะลบออกจาก courses
    calgpax()
    res.status(200).json({
      success: true,
      data: myCourses
    });
  }

})

app.post('/addCourse', (req, res) => {
  const Bodylength = Object.keys(req.body).length
  if (Bodylength !== 4) {
    res.status(422).json({
      success: false,
      error: "ใส่ข้อมูลไม่ครบ"
    })
  }
  else {
    myCourses.courses.push(req.body)
    calgpax()
    res.status(201).json({
      success: true,
      data: req.body
    });
  }
})

//follow instruction in http://localhost:8000/

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server started on port:${port}`));
