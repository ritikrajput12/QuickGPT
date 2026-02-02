import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Credits = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  const { token, axios } = useAppContext()

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/api/credit/plan', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('CREDIT API RESPONSE 👉', data)

      if (data?.success && Array.isArray(data.plans)) {
        setPlans(data.plans)
      } else {
        setPlans([])
        toast.error('Invalid plans data')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post(
        '/api/credit/purchase',
        { planId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl h-screen overflow-y-scroll mx-auto px-4 py-12">
      <h2 className="text-3xl font-semibold text-center mb-10">
        Credit Plans
      </h2>

      <div className="flex flex-wrap justify-center gap-8">
        {plans.length === 0 && (
          <p className="text-center text-gray-500">
            No plans available
          </p>
        )}

        {plans.map((plan) => {
          if (!plan) return null

          return (
            <div
              key={plan._id}
              className="border rounded-lg shadow p-6 min-w-[300px] flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {plan.name || 'Unnamed Plan'}
                </h3>

                <p className="text-2xl font-bold mb-4">
                  ${plan.price ?? 0}
                  <span className="text-sm font-normal">
                    {' '} / {plan.credits ?? 0} credits
                  </span>
                </p>

                <ul className="list-disc list-inside text-sm space-y-1">
                  {Array.isArray(plan.features)
                    ? plan.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))
                    : <li>No features provided</li>
                  }
                </ul>
              </div>

              <button
                onClick={() =>
                  toast.promise(
                    purchasePlan(plan._id),
                    {
                      loading: 'Processing...',
                      success: 'Redirecting...',
                      error: 'Payment failed'
                    }
                  )
                }
                className="mt-6 bg-purple-600 text-white py-2 rounded"
              >
                Buy Now
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Credits