from flask import Flask, jsonify, render_template
import pandas as pd
import numpy as np
from modules.data_processing import calculate_percentage, data_creation

# Flask 애플리케이션 생성
app = Flask(__name__)

# CSV 파일을 데이터프레임으로 읽기
# 'Churn' 열에서 'Yes' 값만 필터링
data_df = pd.read_csv("static/data/Churn_data.csv")
churn_df = data_df[
    (data_df["Churn"] == "Yes").notnull()
]

@app.route("/")
def index():
    return render_template("index.html")

# 파이 차트 데이터 제공 API 앤드포인트
@app.route("/get_piechart_data")
def get_piechart_data():
    contract_labels=['Month-to-month', 'One year', 'Two year']                      # 파이 차트에 사용할 계약 유형 레이블 정의
    contract_counts=churn_df.groupby('Contract').size().values                      # 'Contract' 열을 기준으로 고객 이탈 데이터를 그룹화하고 각각의 크기를 계산
    class_percent=calculate_percentage(contract_counts, np.sum(contract_counts))    # 계약 유형별 비율 계산
    piechart_data=[]
    data_creation(piechart_data, class_percent, contract_labels)                    # 데이터 생성 함수로 계약 유형별 데이터 추가
    return jsonify(piechart_data)

@app.route('/get_barchart_data')
def get_barchart_data():
    tenure_labels = [
        '0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79'
    ]

    # 'tenure_group' 열 생성: tenure 데이터를 0부터 80까지 10 단위로 나누어 그룹화
    churn_df['tenure_group'] = pd.cut(
        churn_df.tenure, range(0, 81, 10), labels=tenure_labels
    )

    # tenure_group과 Contract 열만 선택
    select_df = churn_df[['tenure_group', 'Contract']]                      

    # 계약 유형별로 데이터 분리
    contract_month = select_df[select_df['Contract'] == 'Month-to-month']   
    contract_one = select_df[select_df['Contract'] == 'One year']
    contract_two = select_df[select_df['Contract'] == 'Two year']

    # 계약 유형별 테너 그룹 내 고객 이탈 비율 계산
    mon_percent = calculate_percentage(
        contract_month.groupby('tenure_group').size().values, 
        np.sum(contract_month.groupby('tenure_group').size().values)
    )
    one_percent = calculate_percentage(
        contract_one.groupby('tenure_group').size().values, 
        np.sum(contract_one.groupby('tenure_group').size().values)
    )
    two_percent = calculate_percentage(
        contract_two.groupby('tenure_group').size().values, 
        np.sum(contract_two.groupby('tenure_group').size().values))
    all_percent = calculate_percentage(
        select_df.groupby('tenure_group').size().values, 
        np.sum(select_df.groupby('tenure_group').size().values))
    
    # 막대 차트 데이터를 저장할 리스트를 생성하고 모든 계약 유형의 데이터를 리스트에 추가
    barchart_data = [] 
    data_creation(barchart_data, all_percent, tenure_labels, "All") 
    data_creation(barchart_data, mon_percent, tenure_labels, "Month-to-month") 
    data_creation(barchart_data, one_percent, tenure_labels, "One year") 
    data_creation(barchart_data, two_percent, tenure_labels, "Two year")

    return jsonify(barchart_data)

if __name__ == '__main__':
    app.run(debug=True)