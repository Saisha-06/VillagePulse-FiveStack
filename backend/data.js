module.exports = {
  users: [
    {
      id: 'testUserId',
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      location: { latitude: 15.3, longitude: 74.14 },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  departments: [
    { id: 'electricity', name: 'Electricity Department' }
  ],

   reports: [
    {
      id: 'demoReport1',
      userId: 'testUserId',
      category: 'Electricity',
      description: 'Streetlight not working',
      location: { latitude: 15.3, longitude: 74.14, village: 'Ponda' },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Pending',
      supportersCount: 0,
      imageUrl: null,
      departmentId: 'electricity',
      teamLead: {},
      resolutionNote: '',
      resolutionImageUrls: []
    }
  ],

  feedbacks: [],
  supportedReports: {},
  departmentDevices: {}
};
