import numpy as np

# 주어진 값(val)과 전체 값(total)을 받아 백분율을 계산하는 함수
def calculate_percentage(val, totlal):
    percent = np.round((np.divide(val, totlal) * 100), 2)   # 백분율 계산 후 소수점 둘째 자리까지 반올림
    return percent

# 데이터를 생성하여 리스트에 추가하는 함수
def data_creation(data, percent, class_labels, group=None):
    # percent 리스트를 순회하며 데이터를 생성
    for index, item in enumerate(percent):
        data_instance = {}                                  # 새로운 데이터 인스턴스를 저장할 딕셔너리
        data_instance['category'] = class_labels[index]     # 카테고리 이름 지정
        data_instance['value'] = item                       # 백분율 값 지정
        data_instance['group'] = group                      # 그룹 정보를 추가 (기본값은 None)
        data.append(data_instance)                          # 생성된 데이터 인스턴스를 리스트에 추가
