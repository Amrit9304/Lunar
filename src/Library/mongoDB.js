import mongoose from 'mongoose';

mongoose.set('strictQuery', false); // Disable strict query mode

const { Schema, connect, model: _model } = mongoose;
const defaultOptions = { useNewUrlParser: true, useUnifiedTopology: true };

export class MongoDB {
  constructor(url, options = defaultOptions) {
    /**
     * @type {string}
     */
    this.url = url;
    /**
     * @type {mongoose.ConnectOptions}
     */
    this.options = options;
    this.data = this._data = {};
    /**
     * @type {mongoose.Schema}
     */
    this._schema = {};
    /**
     * @type {mongoose.Model}
     */
    this._model = {};
    /**
     * @type {Promise<typeof mongoose>}
     */
    this.db = connect(this.url, { ...this.options })
      .then((db) => {
        console.log('MongoDB connected'); // Log when MongoDB is connected
        return db;
      })
      .catch(console.error);
  }

  async read() {
    this.conn = await this.db;
    let schema = this._schema = new Schema({
      data: {
        type: Object,
        required: true, // depends on whether the field is mandatory or not
        default: {}
      }
    });
    try {
      this._model = _model('data', schema);
    } catch {
      this._model = _model('data');
    }
    this._data = await this._model.findOne({});
    if (!this._data) {
      this.data = {};
      const [_, _data] = await Promise.all([
        this.write(this.data),
        this._model.findOne({})
      ]);
      this._data = _data;
    } else this.data = this._data.data;
    return this.data;
  }

  async write(data) {
    if (!data) throw new Error('Invalid data');
  
    try {
      let existingData = await this._model.findOne({}); // Find any existing document
      if (!existingData) {
        const newData = new this._model({ data });
        existingData = await newData.save(); // Create a new document if none exists
      } else {
        existingData.data = data; // Update existing document's data
        existingData = await existingData.save();
      }
  
      this._data = existingData;
      this.data = existingData.data;
      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  

}
