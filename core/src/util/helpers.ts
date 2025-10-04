export function getAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Academic year starts in September but consider summer months for creating internships
  // or applying for internships for next academic year
  const startYear = month >= 6 ? year : year - 1;
  const endYear = startYear + 1;

  const startDate = new Date(`${startYear}-07-01T00:00:00Z`);
  const endDate = new Date(`${endYear}-06-30T23:59:59Z`);

  const academicYear = `${startYear}/${endYear}`;

  return { startYear, endYear, startDate, endDate, academicYear };
}

export function todayAtMidnight(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}
