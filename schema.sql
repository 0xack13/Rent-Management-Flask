drop table if exists renters;
create table renters (
  id integer primary key autoincrement,
  renterName string not null,
  rentAmount string not null,
  rentAmountDate DATETIME not null
);