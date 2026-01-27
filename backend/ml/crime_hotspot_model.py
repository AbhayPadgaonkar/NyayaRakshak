from sklearn.cluster import KMeans

def ml_hotspots(coordinates):
    model = KMeans(n_clusters=5)
    model.fit(coordinates)
    return model.labels_.tolist()
