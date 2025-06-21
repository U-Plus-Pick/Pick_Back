import mongoose from 'mongoose'

const benefitSchema = new mongoose.Schema({
  membership_tap: {
    type: String,
    required: true,
    enum: ['VIP 콕', '기본 혜택'],
  },
  membership_brand: {
    type: String,
    required: true,
    index: true,
  },
  membership_description: {
    type: String,
    required: true,
  },
  membership_grade: {
    type: String,
    enum: ['VIP', 'BASIC'],
    default: function () {
      return this.membership_tap === 'VIP 콕' ? 'VIP' : 'BASIC'
    },
  },
})

benefitSchema.index({
  membership_brand: 'text',
  membership_description: 'text',
  aliases: 'text',
})

const Benefit = mongoose.model('Benefit', benefitSchema)

export default Benefit
