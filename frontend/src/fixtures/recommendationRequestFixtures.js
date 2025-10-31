const recommendationRequestFixtures = {
  oneRequest: {
    id: 1,
    requesterEmail: "aaa@ucsb.edu",
    professorEmail: "profA@ucsb.edu",
    explanation: "Grad school recommendation",
    dateRequested: "2025-10-01T09:00:00",
    dateNeeded: "2025-10-15T23:59:00",
    done: false,
  },

  threeRequests: [
    {
      id: 1,
      requesterEmail: "aaa@ucsb.edu",
      professorEmail: "profA@ucsb.edu",
      explanation: "Grad school recommendation",
      dateRequested: "2025-10-01T09:00:00",
      dateNeeded: "2025-10-15T23:59:00",
      done: false,
    },
    {
      id: 2,
      requesterEmail: "bbb@ucsb.edu",
      professorEmail: "profB@ucsb.edu",
      explanation: "Research internship reference",
      dateRequested: "2025-09-20T14:30:00",
      dateNeeded: "2025-10-05T23:59:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "ccc@ucsb.edu",
      professorEmail: "profC@ucsb.edu",
      explanation: "Scholarship application",
      dateRequested: "2025-10-10T08:00:00",
      dateNeeded: "2025-10-20T12:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };
