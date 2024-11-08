import Database from '../../config/database.js'

export default class LessonsController {
  async index(req, res) {

    let { date, status, teacherIds, studentsCount, page, lessonsPerPage } = req.query
    if(!page) page = 1

    if (!lessonsPerPage) lessonsPerPage = 5

    const query = Database('lessons').select('*').orderBy('id', 'asc')

    if (date) {
      const dates = date.split(',')
      if (dates.length > 1) {
        query.whereBetween('lessons.date', dates)
      } else {
        query.where('lessons.date', date)
      }
    }

    if (status) query.andWhere('status', status)

    const lessons = await query.offset((page - 1) * lessonsPerPage).limit(parseInt(lessonsPerPage, 10))
    const lessonsIds = lessons.map(e => e.id)

    const teachersQuery = Database('lesson_teachers')
      .select('teachers.id', 'teachers.name', 'lesson_teachers.lesson_id')
      .innerJoin('teachers', 'lesson_teachers.teacher_id', 'teachers.id')
      .whereIn('lesson_teachers.lesson_id', lessonsIds)
      .groupBy('teachers.id', 'teachers.name', 'lesson_teachers.lesson_id')

    if (teacherIds) {
      const ids = teacherIds.split(',')
      teachersQuery.whereIn('teachers.id', ids)
    }

    const teacherss = await teachersQuery

    const studentsQuery = Database('lesson_students')
      .select('students.id', 'students.name', 'lesson_students.visit', 'lesson_students.lesson_id')
      .innerJoin('students', 'lesson_students.student_id', 'students.id')
      .whereIn('lesson_students.lesson_id', lessonsIds)
      .groupBy('students.id', 'students.name', 'lesson_students.visit', 'lesson_students.lesson_id')

    const students = await studentsQuery

    let result = lessons.map(lesson => {
      const teachers = teacherss.filter(teacher => teacher.lesson_id === lesson.id)

      if(teacherIds) {
        const teacherIdsArray = teacherIds.split(',').map(Number)
        const hasTeacher = teachers.some(teacher => teacherIdsArray.includes(teacher.id))

        if (!hasTeacher) {
          return null
        }
      }

      const visitCount = students.reduce((count, student) => {
        return student.visit && student.lesson_id === lesson.id ? count + 1 : count
      }, 0)

      const studentsFilter = students.filter(student => student.lesson_id === lesson.id)

      lesson.visitCount = visitCount
      lesson.students = studentsFilter
      lesson.teachers = teachers

      if (!studentsCount) {
        return lesson
      } else {
        const count = studentsCount.split(',').map(Number)

        if (count.length === 2) {
          const [minCount, maxCount] = count
          if (lesson.students.length >= minCount || lesson.students.length <= maxCount) {
            return lesson
          }

        } else if (count.length === 1) {

          const exactCount = count[0]
          if (lesson.students.length === exactCount) {
            return lesson
          }

        }
      }
      return null

    }).filter(lesson => lesson !== null)

    res.json(result)

  }

  async show() {
  }

  async store() {
  }

  async update() {
  }

  async destroy() {
  }
}
