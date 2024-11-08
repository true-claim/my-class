import { check, validationResult } from 'express-validator'

export const validateLessons = [
  check('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})?$/)
    .withMessage('Invalid date format. Use YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD'),
  
  check('status')
    .optional()
    .isIn([0, 1])
    .withMessage('Status must be 0 (not conducted) or 1 (conducted)'),
  
  check('teacherIds')
    .optional()
    .matches(/^\d+(,\d+)*$/)
    .withMessage('Teacher IDs must be a comma-separated list of numbers'),
  
  check('studentsCount')
    .optional()
    .matches(/^\d+(,\d+)?$/)
    .withMessage('Students count must be a number or a comma-separated range of numbers'),
  
  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  check('lessonsPerPage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Lessons per page must be a positive integer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  }
]
