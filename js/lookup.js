
// takes JSON object as argument and browses for requirements, eligibility and names, and returns them in an array
// OBSERVE: prerequisites does not mean REQUIREMENTS, only recommendations
// return example: ["name", ["course eligibilities"], ["course prerequisites"]]
function searching(data){
  var eligArray = [];
  var requiredCourse;
  var preqArray = [];
  var courseName;
  var finalResultArray = [];

  // this one finds the eligibility courses (REQUIRED COURSES)
  // can be found in the KOPPS API under PublicSyllabusVersions 0 (recent)
  if(data.publicSyllabusVersions[0].courseSyllabus.eligibility){
    requiredCourse = data.publicSyllabusVersions[0].courseSyllabus.eligibility;
  }
  eligArray = new Array(requiredCourse.match(/[A-Z][A-Z][0-9][0-9][0-9][0-9]/g))

  //this one finds the prerequisites (recommended courses)
  // can be found in the KOPPS API somewhere
  if(data.course.prerequisites){
    var recommendedCourse = data.course.prerequisites;
    //finds all coursecodes in the recommended courses string
    preqArray = new Array(recommendedCourse.match(/[A-Z][A-Z][0-9][0-9][0-9][0-9]/g));//recs;
  }

  courseName = new String(data.course.title);
  finalResultArray = [courseName, eligArray, preqArray];

  return finalResultArray;
}

// first function called, takes a course ID as argument and calls for 'searching' function with JSON object from KOPPS api
// returns result: passes JSON object as argument to 'searching' and returns result
function lookup(courseID){
  var jsonObject;
  var request = new XMLHttpRequest();
  request.open('GET', 'https://api.kth.se/api/kopps/v2/course/' + courseID +  '/detailedinformation', false);  // `false` makes the request synchronous
  request.send(null);
    
  if (request.status === 200) {// That's HTTP for 'ok'
    jsonObject = JSON.parse(request.responseText);
    return searching(jsonObject);
  }

}






class Node {
  constructor(courseCode){
    this.courseName;
    this.courseCode = courseCode;
    this.prerequisites = [];
    this.courseURL = "https://www.kth.se/student/kurser/kurs/" + courseCode;
    this.parentNode = null;
    this._json_id = globalIDcount++;
  }
  buildTree() {

    var reqArr = this.jsonToArray();

    for (var i = 0; i < reqArr.length; i++){
      var temp = new Node(reqArr[i]);

      temp.parentNode = this;
      this.addChild(temp);
      temp.buildTree();
    }
    return this;
  }
}

function nodifyLookup(courseCode){
  var temp = lookup(courseCode);
  var lookupNode = new Node(courseCode);
  lookupNode.courseName = temp[0];
  lookupNode.prerequisites = temp[2];
}