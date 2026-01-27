def link_evidence(crime_time, camera_time, same_location):
    return abs(crime_time - camera_time) <= 1800 and same_location
