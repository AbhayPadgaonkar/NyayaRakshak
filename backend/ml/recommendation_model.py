def recommend_cameras(crime_time, cameras):
    cameras.sort(key=lambda c: abs(c["time"] - crime_time))
    return cameras[:3]
