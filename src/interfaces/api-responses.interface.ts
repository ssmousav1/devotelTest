export interface API1JobDetails {
  location: string;
  type: string;
  salaryRange: string;
}

export interface API1Company {
  name: string;
  industry: string;
}

export interface API1Job {
  jobId: string;
  title: string;
  details: API1JobDetails;
  company: API1Company;
  skills: string[];
  postedDate: string;
}

export interface API1Response {
  metadata: {
    requestId: string;
    timestamp: string;
  };
  jobs: API1Job[];
}

export interface API2Location {
  city: string;
  state: string;
  remote: boolean;
}

export interface API2Compensation {
  min: number;
  max: number;
  currency: string;
}

export interface API2Employer {
  companyName: string;
  website: string;
}

export interface API2Requirements {
  experience: number;
  technologies: string[];
}

export interface API2Job {
  position: string;
  location: API2Location;
  compensation: API2Compensation;
  employer: API2Employer;
  requirements: API2Requirements;
  datePosted: string;
}

export interface API2Response {
  status: string;
  data: {
    jobsList: {
      [key: string]: API2Job;
    };
  };
}
