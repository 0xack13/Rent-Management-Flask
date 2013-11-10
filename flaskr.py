# -*- coding: utf-8 -*-

from __future__ import with_statement
from contextlib import closing
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash, jsonify


# configuration
DATABASE = '/tmp/flaskr.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'admin'

# create flask application
app = Flask(__name__)
app.config.from_object(__name__)

tasks = [
    {
        'id': 1,
        'title': u'Buy groceries',
        'description': u'Milk, Cheese, Pizza, Fruit, Tylenol', 
        'done': False
    },
    {
        'id': 2,
        'title': u'Learn Python',
        'description': u'Need to find a good Python tutorial on the web', 
        'done': False
    }
]

def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()

def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    g.db.close()

@app.route('/')
def show_renters():
    # Verify logged in users
    if not session.get('logged_in'):
        return render_template('login.html')
    cur = g.db.execute('select id, renterName, rentAmount, strftime("%Y-%m-%d",date(rentAmountDate)) from renters order by id desc')
    renters = [dict(id=row[0], renterName=row[1], rentAmount=row[2], rentAmountDate=row[3]) for row in cur.fetchall()]
    return render_template('show_renters.html', renters=renters)

# List Renters by Renter Name
@app.route('/listRenters')
def list_renters():
    # Verify logged in users
    if not session.get('logged_in'):
        return render_template('login.html')
    cur = g.db.execute('select distinct(renterName) from renters')
    renters = [dict(renterName=row[0]) for row in cur.fetchall()]
    return render_template('list_renters.html', rentersList=renters)

@app.route('/calendar')
def show_cal():
    return render_template('calendarsPickerBasic.html')

@app.route('/add', methods=['POST'])
def add_rent():
    # Verify logged in users
    if not session.get('logged_in'):
        abort(401)
    amountvalue = request.form['rentAmountTxt']
    amountvalue = amountvalue.encode('utf-8')
    dateStr = request.form['year'] + "-" + request.form['month'] + "-" + request.form['day']
    g.db.execute('insert into renters (renterName, rentAmount, rentAmountDate) values (?, ?, ?)',
                [request.form['renterNameTxt'], amountvalue, dateStr])
    g.db.commit()
    flash(u' تم حفظ العمليه بنجاح ')
    return redirect(url_for('show_renters'))


@app.route('/delete/<int:renter_id>')
def delete_rent(renter_id):
    # Verify logged in users
    if not session.get('logged_in'):
        abort(401)
    g.db.execute('delete from renters where id = ?',
                [renter_id])
    g.db.commit()
    flash(u' تم حذف العمليه بنجاح ')
    return redirect(url_for('show_renters'))



app.add_url_rule('/delete/<int:renter_id>',
                 view_func=delete_rent,
                 methods=['DELETE','PUT','GET'])

# @app.route('/login', methods['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_renters'))
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_renters'))

# app.add_url_rule('/favicon.ico',
#                  redirect_to=url_for('static', filename='favicon.ico'))

# API Routers Start Here! +++++++++++++++++++++++++++++++
# +++++++++++++++++++++++++++++++++++++++++++++++++++++++
# Basic API for getting renters information
@app.route('/renters/api/', methods = ['GET'])
def get_renters():
    #  return jsonify( { 'tasks': tasks } )
    cur = g.db.execute('select id, renterName, rentAmount, strftime("%Y-%m-%d",date(rentAmountDate)) from renters order by id desc')
    renters = [dict(id=row[0], renterName=row[1], rentAmount=row[2], rentAmountDate=row[3]) for row in cur.fetchall()]
    # entries = [dict(title=row[0], description=row[1]) for row in cur.fetchall()]
    return jsonify( renters = renters )

#List Renters API
@app.route('/renters/api/listRentersAPI', methods = ['GET'])
def list_rentersAPI():
    #  return jsonify( { 'tasks': tasks } )
    cur = g.db.execute('select distinct(renterName) from renters')
    renters = [dict(renterName=row[0]) for row in cur.fetchall()]
    #entries = [dict(title=row[0], description=row[1]) for row in cur.fetchall()]
    return jsonify( renters = renters )

# listRentsByRenters
#List Renters API
@app.route('/renters/api/listRentsByRentersAPI/<string:task_name>/<string:d>/<string:m>/<string:y>', methods = ['GET'])
def listRentsByRenters(task_name, d, m, y):
    #if (d > 0) and (m > 0) and (y > 0):
    dateStr = y + "-" + m + "-" + d
    cur = g.db.execute('select id, renterName, rentAmount, strftime("%Y-%m-%d",date(rentAmountDate)) from renters where renterName = ? and rentAmountDate = ?', [task_name, dateStr])
    #else:
    #    cur = g.db.execute('select id, renterName, rentAmount, strftime("%Y-%m-%d",date(rentAmountDate)) from renters where renterName = ?', [task_name])
    renters = [dict(id=row[0], renterName=row[1], rentAmount=row[2], rentAmountDate=row[3]) for row in cur.fetchall()]
    # entries = [dict(title=row[0], description=row[1]) for row in cur.fetchall()]
    return jsonify( renters = renters )


@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['PUT'])
def update_task(task_id):
    #task = filter(lambda t: t['id'] == task_id, tasks)
    # if len(task) == 0:
    #     abort(404)
    # tasks.remove(task[0])
    g.db.execute('UPDATE renters SET renterName=?, rentAmount=?, rentAmountDate=? WHERE id=?', [request.json['renterName'], request.json['rentAmount'], request.json['rentAmountDate'], task_id])
    g.db.commit()
    return jsonify( { 'result': True } )


@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['DELETE'])
def delete_task(task_id):
    #task = filter(lambda t: t['id'] == task_id, tasks)
    # if len(task) == 0:
    #     abort(404)
    # tasks.remove(task[0])
    g.db.execute('delete from renters where id = ?',
                [task_id])
    g.db.commit()
    return jsonify( { 'result': True } )





if __name__ == '__main__':
    app.run()