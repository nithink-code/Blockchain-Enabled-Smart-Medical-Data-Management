// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TimeBasedHealthAccess {
    
    enum RequestStatus { Pending, Approved, Rejected, Revoked }

    struct AccessRequest {
        uint256 requestId;
        address hospital;
        address patient;
        string recordHash;    
        uint256 duration;      
        uint256 startTime;    
        uint256 expiryTime;   
        RequestStatus status;
    }

    uint256 private _requestCounter;
    
    mapping(uint256 => AccessRequest) public requests;
    
    mapping(address => uint256[]) private hospitalRequests;
    
    mapping(address => uint256[]) private patientRequests;

    event AccessRequested(uint256 indexed requestId, address indexed hospital, address indexed patient, uint256 duration);
    event AccessApproved(uint256 indexed requestId, address indexed patient, address indexed hospital, uint256 expiryTime);
    event AccessRejected(uint256 indexed requestId, address indexed patient);
    event AccessRevoked(uint256 indexed requestId, address indexed patient);

    modifier onlyPatient(uint256 _requestId) {
        require(msg.sender == requests[_requestId].patient, "Caller is not the patient");
        _;
    }

    modifier onlyHospital(uint256 _requestId) {
        require(msg.sender == requests[_requestId].hospital, "Caller is not the hospital");
        _;
    }

    function requestAccess(
        address _patient, 
        string calldata _recordHash, 
        uint256 _durationInSeconds
    ) external returns (uint256) {
        require(_patient != address(0), "Invalid patient address");
        require(_durationInSeconds > 0, "Duration must be greater than 0");

        _requestCounter++;
        uint256 newRequestId = _requestCounter;

        requests[newRequestId] = AccessRequest({
            requestId: newRequestId,
            hospital: msg.sender,
            patient: _patient,
            recordHash: _recordHash,
            duration: _durationInSeconds,
            startTime: 0,
            expiryTime: 0,
            status: RequestStatus.Pending
        });

        hospitalRequests[msg.sender].push(newRequestId);
        patientRequests[_patient].push(newRequestId);

        emit AccessRequested(newRequestId, msg.sender, _patient, _durationInSeconds);
        return newRequestId;
    }

    function approveAccess(uint256 _requestId) external onlyPatient(_requestId) {
        AccessRequest storage req = requests[_requestId];
        require(req.status == RequestStatus.Pending, "Request is not pending");

        req.status = RequestStatus.Approved;
        req.startTime = block.timestamp;
        req.expiryTime = block.timestamp + req.duration;

        emit AccessApproved(_requestId, msg.sender, req.hospital, req.expiryTime);
    }

    function rejectAccess(uint256 _requestId) external onlyPatient(_requestId) {
        AccessRequest storage req = requests[_requestId];
        require(req.status == RequestStatus.Pending, "Request is not pending");

        req.status = RequestStatus.Rejected;
        emit AccessRejected(_requestId, msg.sender);
    }

    function revokeAccess(uint256 _requestId) external onlyPatient(_requestId) {
        AccessRequest storage req = requests[_requestId];
        require(req.status == RequestStatus.Approved, "Request is not active");

        req.status = RequestStatus.Revoked;
        emit AccessRevoked(_requestId, msg.sender);
    }

    function fetchRecord(uint256 _requestId) external view onlyHospital(_requestId) returns (string memory) {
        AccessRequest memory req = requests[_requestId];

        require(req.status == RequestStatus.Approved, "Access not approved or revoked");
        require(block.timestamp <= req.expiryTime, "Access period has expired");

        return req.recordHash;
    }

    function isAccessActive(uint256 _requestId) external view returns (bool) {
        AccessRequest memory req = requests[_requestId];
        return (req.status == RequestStatus.Approved && block.timestamp <= req.expiryTime);
    }

    function getPatientRequests(address _patient) external view returns (uint256[] memory) {
        return patientRequests[_patient];
    }
}