const HelpRequestFixtures = {
  oneRequest: {
    id: 1,
    requesterEmail: "jonn@ucsb.edu",
    teamId: "1",
    tableOrBreakoutRoom: "table",
    requestTime: "2022-01-02T12:00:00",
    explanation: "neeed help i exploded",
    solved: false,
  },
  threeRequests: [
    {
      id: 2,
      requesterEmail: "honn@ucsb.edu",
      teamId: "2",
      tableOrBreakoutRoom: "table",
      requestTime: "2022-01-02T12:00:00",
      explanation: "need breakup advice",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "bonn@ucsb.edu",
      teamId: "5",
      tableOrBreakoutRoom: "breakout",
      requestTime: "2022-01-02T12:00:00",
      explanation: "just wanna say hi",
      solved: true,
    },
    {
      id: 4,
      requesterEmail: "conn@ucsb.edu",
      teamId: "9",
      tableOrBreakoutRoom: "breakout",
      requestTime: "2022-01-02T12:00:00",
      explanation: "code fails",
      solved: false,
    },
  ],
};

export { HelpRequestFixtures };
